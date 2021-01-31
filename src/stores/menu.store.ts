import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChangeFixedMenuState {
  changeFixedMenu?: any;
}
const menus: any = JSON.parse(localStorage.getItem('menus') || '[]');

const initialState: any = {
  menuList: menus,
  changeFixedMenu: JSON.parse(sessionStorage.getItem('changeFixedMenu') || '[]'),
  cacheFixedMenu: sessionStorage.getItem('cacheFixedMenu') || '[]'
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setChangeFixedMenu(state, action: PayloadAction<Partial<ChangeFixedMenuState>>) {
      const { changeFixedMenu } = action.payload;
      if (changeFixedMenu) {
        sessionStorage.setItem('changeFixedMenu', JSON.stringify(changeFixedMenu));
      }
      //   把这个缓存对象放进去
      Object.assign(state, action.payload);
    }
  }
});

export const { setChangeFixedMenu } = menuSlice.actions;

export default menuSlice.reducer;
