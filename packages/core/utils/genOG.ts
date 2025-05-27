export const formatTitleLength = (title: string, addOnLength = 0) => {
  if (title.length > 60 - addOnLength) {
    return `${title.slice(0, 57 - addOnLength)}...`;
  }
  return title;
};

export const formatDescLength = (desc: string, tags?: string[]) => {
  if (!desc) return;
  if (desc.length > 160) {
    return `${desc.slice(0, 157)}...`;
  }
  if (!tags) return desc;
  const tagStr: string = tags ? tags.join(', ') : '';
  const tagLength = 160 - desc.length - 3;
  const newDesc =
    desc +
    tagStr.slice(0, tagLength) +
    (tagStr.length > tagLength ? '...' : '');
  return newDesc.length <= 157 ? newDesc : `${newDesc}...`;
};
