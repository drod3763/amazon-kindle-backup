export const URLS = {
  LOGIN:
    "https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fhz%2Fmycd%2Fmyx&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0",
  DIGITAL_CONTENT:
    "https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/",
  CD_API: "/hz/mycd/ajax",
  CDN: "https://cde-ta-g7g.amazon.com/FionaCDEServiceEngine/FSDownloadContent",
};

export const SELECTORS = {
  LOGIN: {
    SIGN_IN_BUTTON: "#gw-sign-in-button > span > a",
    EMAIL_INPUT: "#ap_email",
    CONTINUE_BUTTON: ".a-button-input",
    PASSWORD_INPUT: "#ap_password",
    SUBMIT_BUTTON: "#signInSubmit",
    MFA_CODE_INPUT: "#auth-mfa-otpcode",
    MFA_SUBMIT_BUTTON: "#auth-signin-button",
  },
};

export const REGEX = {
  CSRF_TOKEN: /var csrfToken = "(.*)";/,
  CUSTOMER_ID: /customerId: \"(.*)\"/,
};

export const API = {
  CLIENT_ID: "MYCD_WebService",
  CONTENT_TYPE: "Ebook",
  BATCH_SIZE: 1000,
  SORT_ORDER: "DESCENDING",
  SORT_INDEX: "DATE",
  ITEM_STATUS: ["Active"],
  ORIGIN_TYPE: ["Purchase", "Comixology"],
  HEADERS: {
    CONTENT_TYPE: "application/x-www-form-urlencoded",
    CSRF_TOKEN: "anti-csrftoken-a2z",
    ACCEPT: "application/json, text/plain, */*",
  },
};
