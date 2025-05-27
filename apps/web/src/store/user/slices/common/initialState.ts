export interface CommonState {
  isOnboard: boolean;
  // isShowPWAGuide: boolean;
  // isUserCanEnableTrace: boolean;
  isUserStateInit: boolean;
}

export const initialCommonState: CommonState = {
  isOnboard: false,
  // isShowPWAGuide: false,
  // isUserCanEnableTrace: false,
  isUserStateInit: false,
};
