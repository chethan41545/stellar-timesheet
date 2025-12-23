// src/constants/apiUrls.ts
export const API_ENDPOINTS = {
  LOGIN: "/user/login",           // adjust path if your real endpoint differs
  VERIFY_OTP: "/auth/verify-otp",
  LOOKUP: "/lookup",
  CANDIDATE_TIMESHEET_SEARCH: "/timesheet/user/search",
  ALL_CANDIDATE_TIMESHEET_SEARCH: "/timesheet/search",
  GET_TIMESHEET_USER: "/timesheet/details",
  GET_USER_LIST: "/user/search",
  TIMESHEET_UPDATE: "/timesheet/update",
  TIMESHEET_REVIEW: "/timesheet/review",

  PROJECT_REPORTS:"/reports/projects",

  PROJECT_LIST:"/project/search",
  CREATE_PROJECT:"project/create-project",
  CREATE_TASK:"project/create-task"
  // add other endpoints as needed
};
