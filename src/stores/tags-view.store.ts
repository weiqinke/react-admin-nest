import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TagItem, TagState } from 'interface/layout/tagsView.interface';

const initialState: TagState = {
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
      let lastIndex = 0;

      state.tags.forEach((tag, i) => {
        if (tag.meUrl === targetKey) {
          state.tags.splice(i, 1);
          lastIndex = i - 1;
        }
      });
      const tagList = state.tags.filter(tag => tag.meUrl !== targetKey);
      if (tagList.length && activeTagMeUrl === targetKey) {
        if (lastIndex >= 0) {
          state.activeTagMeUrl = tagList[lastIndex].meUrl;
        } else {
          state.activeTagMeUrl = tagList[0].meUrl;
        }
      }
    },
    removeAllTag(state, action: PayloadAction<string>) {
      state.activeTagMeUrl = state.tags[0].meUrl;
      state.tags = [state.tags[0]];
    },
    removeOtherTag(state, action: PayloadAction<string>) {
      var len = state.tags.length;
      const nowurl = action.payload;
      const newTags = [];
      for (let index = 0; index < len; index++) {
        const element = state.tags[index];
        if (element.meUrl === nowurl) {
          newTags.push(element);
          break;
        }
      }
      state.tags = newTags;
    },
    removeLeftTag(state, action: PayloadAction<string>) {
      var flag = false;
      var len = state.tags.length;
      const nowurl = action.payload;
      const newTags = [];
      for (let index = 0; index < len; index++) {
        const element = state.tags[index];
        if (element.meUrl === nowurl) {
          flag = true;
        }
        if (flag) {
          newTags.push(element);
        }
      }
      state.tags = newTags;
    },
    removeRightTag(state, action: PayloadAction<string>) {
      /**删除当前标签的右侧标签 */
      var flag = true;
      var len = state.tags.length;
      const nowurl = action.payload;
      const newTags = [];
      for (let index = 0; index < len; index++) {
        const element = state.tags[index];
        if (element.meUrl === nowurl) {
          newTags.push(element);
          flag = false;
          continue;
        }
        if (flag) {
          newTags.push(element);
        }
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
