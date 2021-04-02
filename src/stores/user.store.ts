import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';
import { Role } from 'interface/user/login';
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
  nick: localStorage.getItem('nick') || '',
  role: (sessionStorage.getItem('role') || '') as Role,
  loginState: sessionStorage.getItem('token') ? true : false,
  indexUrl: '',
  RefreshFCUrl: 'loading',
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
    setRefreshFlag(state, action: any) {
      const { RefreshFlag } = action.payload;
      state.RefreshFlag = RefreshFlag;
    }
  }
});

export const { setUserItem, setIndexUrl, setMenuList, setRefreshFCUrl, setRefreshFlag } = userSlice.actions;

export default userSlice.reducer;

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
