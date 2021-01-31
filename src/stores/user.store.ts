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
  username: localStorage.getItem('username') || '',
  role: (localStorage.getItem('username') || '') as Role,
  loginState: localStorage.getItem('token') ? true : false,
  indexUrl: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserItem(state, action: PayloadAction<Partial<UserState>>) {
      const { username } = action.payload;

      if (username !== state.username) {
        localStorage.setItem('username', action.payload.username || '');
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
    }
  }
});

export const { setUserItem, setIndexUrl, setMenuList } = userSlice.actions;

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
