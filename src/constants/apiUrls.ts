// src/constants/apiUrls.ts
export const API_ENDPOINTS = {
  LOGIN: "/user/login",           // adjust path if your real endpoint differs
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/user/reset-password",
  LOOKUP: "/user/lookup",
  CANDIDATE_TIMESHEET_SEARCH: "/timesheet/user/search",
  ALL_CANDIDATE_TIMESHEET_SEARCH: "/timesheet/search",
  DOWNLOAD_TIMESHEET: "/timesheet/download",
  GET_TIMESHEET_USER: "/timesheet/details",
  GET_USER_LIST: "/user/search",
  GET_USER_ROLES: "/user/roles",
  GET_USER_DETAILS: "/user/details",
  TIMESHEET_UPDATE: "/timesheet/update",
  TIMESHEET_REVIEW: "/timesheet/review",
  TIMESHEET_COPY: "/timesheet/copy-details",

  HOLIDAY_LIST: "/timesheet/holiday/search",

  CREATE_USER:"/user/create-user",
  UPDATE_USER:"",
  DELETE_USER:"",

  PROJECT_REPORTS:"/reports/projects",

  PROJECT_LIST:"/project/search",
  GET_PROJECT_DETAILS:"/project/details",
  CREATE_PROJECT:"project/create-project",
  UPDATE_PROJECT:"project/update-project",
  CREATE_TASK:"project/create-task",
  MANAGE_USER_PROJECT :"user/manage-user-project",
  UN_ASSIGN_USER_PROJECT :"user/un-assign-project"
  // add other endpoints as needed
};
