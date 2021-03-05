import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';
import { apiLogin } from 'api/nest-admin/User';
import { LoginParams, Role } from 'interface/user/login';
import { Locale, UserState } from 'interface/user/user';
import { getGlobalState } from 'utils/getGloabal';

const menus: any = JSON.parse(localStorage.getItem('menus') || '[]');

const initialState: UserState = {
  ...getGlobalState(),
  noticeCount: 0,
  locale: (localStorage.getItem('locale')! || 'zh_CN') as Locale,
  newUser: JSON.parse(localStorage.getItem('newUser')!) ?? true,
  menuList: menus,
  username: sessionStorage.getItem('username') || '',
  nick: sessionStorage.getItem('username') || '',
  role: (localStorage.getItem('username') || '') as Role,
  loginState: localStorage.getItem('token') ? true : false,
  indexUrl: '',
  RefreshFCUrl: '/workplace',
  RefreshFlag: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserItem(state, action: PayloadAction<Partial<UserState>>) {
      const { username, nick } = action.payload;
      if (username !== state.username) {
        sessionStorage.setItem('username', username || '');
      }
      if (nick !== state.nick) {
        sessionStorage.setItem('nick', nick || '');
      }
      Object.assign(state, action.payload);
    },
    setIndexUrl(state, action: PayloadAction<Partial<UserState>>) {
      const { indexUrl } = action.payload;
      state.indexUrl = indexUrl || '';
      localStorage.setItem('indexUrl', indexUrl || '');
    },
    setMenuList(state, action: PayloadAction<Partial<UserState>>) {
      const { menuList } = action.payload;
      state.menuList = menuList || [];
      localStorage.setItem('menus', JSON.stringify(menuList));
    },
    setRefreshFCUrl(state, action: any) {
      const { RefreshFCUrl, RefreshFlag = false } = action.payload;
      state.RefreshFCUrl = RefreshFCUrl;
      state.RefreshFlag = RefreshFlag;
    },
    serRefreshFlag(state, action: any) {
      const { RefreshFlag } = action.payload;
      state.RefreshFlag = RefreshFlag;
    }
  }
});

export const { setUserItem, setIndexUrl, setMenuList, setRefreshFCUrl, serRefreshFlag } = userSlice.actions;

export default userSlice.reducer;

export const loginAsync = (payload: LoginParams) => {
  return async (dispatch: Dispatch) => {
    apiLogin(payload).then((result: any) => {
      localStorage.setItem('t', result.token);
      localStorage.setItem('username', result.username);
      dispatch(
        setUserItem({
          username: result.username
        })
      );
      return true;
    });
    return false;
  };
};

export const logoutAsync = () => {
  return async (dispatch: Dispatch) => {
    dispatch(
      setUserItem({
        loginState: false
      })
    );
    return true;
  };
};

export const logoutSystem = () => {
  return async (dispatch: Dispatch) => {
    localStorage.clear();
    sessionStorage.clear();
    dispatch(
      setUserItem({
        loginState: false
      })
    );
    return true;
  };
};
