import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TagItem, TagState } from 'interface/layout/tagsView.interface';

const initialState: TagState = {
  /**正在显示的路由 */
  activeTagMeUrl: '',
  tags: [],
  tagPlanVisible: false
};

const tagsViewSlice = createSlice({
  name: 'tagsView',
  initialState,
  reducers: {
    setActiveTag(state, action: PayloadAction<string>) {
      state.activeTagMeUrl = action.payload;
    },
    addTag(state, action: PayloadAction<TagItem>) {
      if (!state.tags.find(tag => tag.meUrl === action.payload.meUrl)) {
        state.tags.push(action.payload);
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      const targetKey = action.payload;
      // 只剩下一个了，别删除了
      if (state.tags.length <= 1) {
        return;
      }
      let activeTagMeUrl = state.activeTagMeUrl;
      const tagList = state.tags.filter(tag => tag.meUrl !== targetKey);
      state.tags = tagList;
      const nowTag = tagList.filter(tag => tag.meUrl === activeTagMeUrl);
      if (nowTag.length !== 1) {
        state.activeTagMeUrl = state.tags[state.tags.length - 1]['meUrl'];
      }
    },
    removeAllTag(state, action: PayloadAction<string>) {
      state.activeTagMeUrl = state.tags[0].meUrl;
      state.tags = [state.tags[0]];
    },
    removeOtherTag(state, action: PayloadAction<string>) {
      //选中了谁，就用谁显示
      const changeurl = action.payload;
      const newTags = state.tags.filter(tag => tag.meUrl === changeurl);
      state.tags = newTags;
      state.activeTagMeUrl = changeurl;
    },
    removeLeftTag(state, action: PayloadAction<string>) {
      //这儿需要判断，如果是从当前节点往左，找到了正在显示的页面，就点击当前页签，否则认为关闭了其他无用窗口
      let activeTagMeUrl = state.activeTagMeUrl;
      const changeurl = action.payload;
      var len = state.tags.length;
      var flag = false;
      const newTags = [];
      for (let index = 0; index < len; index++) {
        const element = state.tags[index];
        if (element.meUrl === changeurl) {
          flag = true;
        }
        if (flag) {
          newTags.push(element);
        }
      }
      const findresult = newTags.filter(tag => tag.meUrl === activeTagMeUrl);
      if (findresult.length !== 1) {
        state.activeTagMeUrl = changeurl;
      }
      state.tags = newTags;
    },
    removeRightTag(state, action: PayloadAction<string>) {
      //这儿需要判断，如果是从当前节点往左，找到了正在显示的页面，就点击当前页签，否则认为关闭了其他无用窗口
      let activeTagMeUrl = state.activeTagMeUrl;
      const changeurl = action.payload;
      var len = state.tags.length;
      const newTags = [];
      for (let index = 0; index < len; index++) {
        const element = state.tags[index];
        newTags.push(element);
        if (element.meUrl === changeurl) {
          break;
        }
      }
      const findresult = newTags.filter(tag => tag.meUrl === activeTagMeUrl);
      if (findresult.length !== 1) {
        state.activeTagMeUrl = changeurl;
      }
      state.tags = newTags;
    },
    setTagPlanVisible(state, action: PayloadAction<boolean>) {
      state.tagPlanVisible = action.payload;
    },
    deleteAllTag(state) {
      state.activeTagMeUrl = '';
      state.tags = [];
    }
  }
});

export const {
  setActiveTag,
  addTag,
  removeTag,
  removeAllTag,
  removeLeftTag,
  removeRightTag,
  removeOtherTag,
  setTagPlanVisible,
  deleteAllTag
} = tagsViewSlice.actions;

export default tagsViewSlice.reducer;
