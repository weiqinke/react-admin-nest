export type TagItem = {
  id?: string;

  label: {
    zh_CN: string;
    en_US: string;
  };

  /** tag's route path */
  path: string;

  /** can be closed ? */
  closable: boolean;
  authority?: string;
  children?: [];
  icon?: string;
  name?: string;
  router?: string;
  meUrl: string;
};

export interface TagState {
  /** tagsView list */
  tags: TagItem[];

  /**current tagView id */
  activeTagMeUrl: TagItem['meUrl'];
}
