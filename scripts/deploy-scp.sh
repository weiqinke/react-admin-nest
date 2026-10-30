#!/usr/bin/env bash
# 把已打好的 dist 压缩包用 scp 上传到服务器，在远端解压到站点目录，并删除旧版本。
# 连接信息来自环境变量（GitHub Actions Secrets），不要把私钥写进仓库。
set -euo pipefail

missing=0
require_secret() {
  local name=$1
  local value=${2-}
  if [ -z "$value" ]; then
    echo "::error::缺少 GitHub Secret: ${name}。到仓库 Settings → Secrets and variables → Actions 里新增，不要写进工作流文件。"
    missing=1
  fi
}

require_secret DEPLOY_HOST "${DEPLOY_HOST-}"
require_secret DEPLOY_USER "${DEPLOY_USER-}"
require_secret DEPLOY_SSH_KEY "${DEPLOY_SSH_KEY-}"
require_secret DEPLOY_PATH "${DEPLOY_PATH-}"
if [ "$missing" -ne 0 ]; then
  exit 1
fi

DEPLOY_PORT="${DEPLOY_PORT:-22}"

case "$DEPLOY_PORT" in
  ''|*[!0-9]*)
    echo "::error::DEPLOY_PORT 必须是数字，当前无法使用。留空这个 Secret 时会用 22。"
    exit 1
    ;;
esac

case "$DEPLOY_HOST" in
  -*|*[!A-Za-z0-9._-]*)
    echo "::error::DEPLOY_HOST 只能包含字母、数字、点、下划线和连字符（用域名或 IPv4）。"
    exit 1
    ;;
esac

case "$DEPLOY_USER" in
  -*|*[!A-Za-z0-9._-]*)
    echo "::error::DEPLOY_USER 只能包含字母、数字、点、下划线和连字符。"
    exit 1
    ;;
esac

case "$DEPLOY_PATH" in
  /*) ;;
  *)
    echo "::error::DEPLOY_PATH 必须是绝对路径，例如 /var/www/nest-admin。"
    exit 1
    ;;
esac

DEPLOY_PATH="${DEPLOY_PATH%/}"
# "/" 去掉末尾斜杠后是空字符串，必须在这里拦住。
if [ -z "$DEPLOY_PATH" ]; then
  echo "::error::拒绝部署到 /。请使用只放本站点的目录，例如 /var/www/nest-admin。"
  exit 1
fi
case "$DEPLOY_PATH" in
  *..*|*' '*|*'	'*|*//*)
    echo "::error::DEPLOY_PATH 不能包含 ..、空白或连续斜杠。"
    exit 1
    ;;
esac

case "$DEPLOY_PATH" in
  /|/bin|/boot|/dev|/etc|/home|/lib|/lib64|/opt|/proc|/root|/run|/sbin|/srv|/sys|/tmp|/usr|/var|/var/www|/usr/share)
    echo "::error::拒绝部署到 ${DEPLOY_PATH}。请使用只放本站点的目录，例如 /var/www/nest-admin。"
    exit 1
    ;;
esac

ssh_dir="${RUNNER_TEMP:-/tmp}/nest-admin-ssh"
rm -rf "$ssh_dir"
mkdir -p "$ssh_dir"
chmod 700 "$ssh_dir"
trap 'rm -rf "$ssh_dir"' EXIT
key_file="${ssh_dir}/deploy_key"
known_hosts="${ssh_dir}/known_hosts"

# 网页上粘贴私钥时，换行有时会变成字面量 \n。
if printf '%s' "$DEPLOY_SSH_KEY" | grep -q '\\n'; then
  printf '%b\n' "$DEPLOY_SSH_KEY" | tr -d '\r' >"$key_file"
else
  printf '%s\n' "$DEPLOY_SSH_KEY" | tr -d '\r' >"$key_file"
fi
chmod 600 "$key_file"

if ! grep -q "PRIVATE KEY" "$key_file"; then
  echo "::error::DEPLOY_SSH_KEY 不是私钥。请粘贴完整内容，包含 BEGIN 和 END 行。公钥放到服务器对应用户的 ~/.ssh/authorized_keys。"
  exit 1
fi

archive="${DIST_ARCHIVE:-dist.tar.gz}"
if [ ! -f "$archive" ]; then
  echo "::error::找不到构建包 ${archive}。先完成 vite build 再打包 dist。"
  exit 1
fi

run_id="${GITHUB_RUN_ID:-0}"
run_attempt="${GITHUB_RUN_ATTEMPT:-1}"
case "$run_id" in *[!0-9]*) run_id=0 ;; esac
case "$run_attempt" in *[!0-9]*) run_attempt=1 ;; esac
remote_archive="/tmp/nest-admin-web-${run_id}-${run_attempt}.tar.gz"

if [ -n "${DEPLOY_KNOWN_HOSTS-}" ]; then
  printf '%s\n' "$DEPLOY_KNOWN_HOSTS" | tr -d '\r' >"$known_hosts"
else
  echo "未设置 DEPLOY_KNOWN_HOSTS，正在用 ssh-keyscan 获取主机公钥。建议把下面的输出存进该 Secret，避免每次重新信任。"
  ssh-keyscan -T 10 -p "$DEPLOY_PORT" "$DEPLOY_HOST" | tee "$known_hosts"
fi
chmod 600 "$known_hosts"

if ! grep -q . "$known_hosts"; then
  echo "::error::没有拿到主机公钥。检查 DEPLOY_HOST 和 DEPLOY_PORT，或把 ssh-keyscan 的结果填进 DEPLOY_KNOWN_HOSTS。"
  exit 1
fi

ssh_opts=(
  -i "$key_file"
  -p "$DEPLOY_PORT"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes
  -o UserKnownHostsFile="$known_hosts"
  -o ConnectTimeout=20
)
scp_opts=(
  -i "$key_file"
  -P "$DEPLOY_PORT"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes
  -o UserKnownHostsFile="$known_hosts"
  -o ConnectTimeout=20
)

echo "scp ${archive} -> ${DEPLOY_USER}@${DEPLOY_HOST}:${remote_archive}"
scp "${scp_opts[@]}" "$archive" "${DEPLOY_USER}@${DEPLOY_HOST}:${remote_archive}"

echo "上传完成，在服务器解压到 ${DEPLOY_PATH}"
ssh "${ssh_opts[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s -- "$DEPLOY_PATH" "$remote_archive" <<'EOF'
set -eu
dest=$1
archive=$2

parent=$(dirname "$dest")
name=$(basename "$dest")
# 先在 /tmp 解压。scp 能写到 /tmp，不依赖站点父目录是否可写。
release=$(mktemp -d /tmp/nest-admin-release.XXXXXX)
staging=""
cleanup_tmp() {
  rm -rf "$release"
  if [ -n "$staging" ] && [ "$staging" != "$dest" ] && [ -d "$staging" ]; then
    rm -rf "$staging"
  fi
}
trap cleanup_tmp EXIT
tar -xzf "$archive" -C "$release" || {
  rm -f "$archive"
  exit 1
}
rm -f "$archive"
# 压缩包里的 ./ 会把目录权限盖回打包机的 umask（常见 700）。
chmod 755 "$release"
chmod -R a+rX "$release"

if [ ! -f "$release/index.html" ]; then
  echo "构建包里没有 index.html，停止发布。" >&2
  exit 1
fi

# 先写入新文件，再删包里已经没有的旧文件，避免先清空导致 /js/* 短暂 404。
remove_stale_files() {
  target=$1
  list=$(mktemp)
  find "$target" -mindepth 1 -depth >"$list"
  while IFS= read -r item; do
    [ -n "$item" ] || continue
    rel=${item#"$target"/}
    if [ ! -e "$release/$rel" ] && [ ! -L "$release/$rel" ]; then
      rm -rf "$item"
    fi
  done <"$list"
  rm -f "$list"
}

install_tree() {
  target=$1
  cp -a "$release"/. "$target"/
  remove_stale_files "$target"
  chmod 755 "$target" || true
  chmod -R a+rX "$target" || true
}

# 清掉以前符号链接发布留下的版本目录，以及失败中途留下的临时目录。
delete_old_versions() {
  [ -d "$parent" ] && [ -w "$parent" ] || return 0
  list=$(mktemp)
  find "$parent" -mindepth 1 -maxdepth 1 \( \
    -type d \( \
      -name ".${name}.release.*" -o \
      -name ".${name}.incoming.*" -o \
      -name "${name}.bak.*" \
    \) -o \
    -name ".${name}.prev.*" \
  \) >"$list"
  while IFS= read -r old; do
    [ -n "$old" ] || continue
    [ "$old" = "$dest" ] && continue
    rm -rf "$old"
    echo "已删除旧版本 ${old}"
  done <"$list"
  rm -f "$list"
}

if [ -L "$dest" ]; then
  echo "站点路径当前是符号链接，解压成普通目录 ${dest}"
  if ! staging=$(mktemp -d "$parent/.$name.incoming.XXXXXX"); then
    echo "无法在 ${parent} 新建目录，不能把符号链接换成普通目录。" >&2
    id >&2 || true
    ls -ld "$parent" "$dest" >&2 || true
    echo "请执行：sudo chown $(id -un) ${parent}" >&2
    exit 1
  fi
  old_target=$(readlink -f "$dest" 2>/dev/null || true)
  cp -a "$release"/. "$staging"/
  chmod 755 "$staging" || true
  chmod -R a+rX "$staging" || true
  prev="${parent}/.${name}.prev.$$"
  mv "$dest" "$prev"
  if ! mv "$staging" "$dest"; then
    mv "$prev" "$dest"
    echo "替换 ${dest} 失败，已恢复原符号链接。" >&2
    exit 1
  fi
  # 目录已经改名为站点路径，退出时不要删掉它。
  staging=""
  rm -f "$prev"
  case "$old_target" in
    "$parent"/.${name}.release.*|"$parent"/${name}.bak.*)
      if [ -d "$old_target" ] && [ "$old_target" != "$dest" ]; then
        rm -rf "$old_target"
        echo "已删除旧版本 ${old_target}"
      fi
      ;;
  esac
  delete_old_versions
elif [ -d "$dest" ]; then
  if [ ! -w "$dest" ]; then
    echo "目录 ${dest} 当前用户不可写。" >&2
    id >&2 || true
    ls -ld "$parent" "$dest" >&2 || true
    echo "请执行：sudo chown -R $(id -un) ${dest}" >&2
    exit 1
  fi
  echo "解压到 ${dest}"
  install_tree "$dest"
  delete_old_versions
elif [ -e "$dest" ]; then
  echo "${dest} 已存在但不是目录，停止发布。" >&2
  exit 1
else
  if ! mkdir "$dest"; then
    echo "无法创建 ${dest}。" >&2
    id >&2 || true
    ls -ld "$parent" >&2 || true
    echo "请执行：sudo mkdir -p ${dest} && sudo chown -R $(id -un) ${dest}" >&2
    exit 1
  fi
  echo "解压到 ${dest}"
  install_tree "$dest"
  delete_old_versions
fi

if [ -L "$dest" ] || [ ! -f "$dest/index.html" ]; then
  echo "发布后 ${dest} 不是包含 index.html 的普通目录。" >&2
  exit 1
fi
echo "已发布 ${dest}"
EOF
