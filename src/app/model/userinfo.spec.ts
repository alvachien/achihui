//
// Unit test for userinfo.ts
//

import { UserDetail, UserAuthInfo } from "./userinfo";

describe("UserDetail", () => {
  let urdtl: UserDetail;

  beforeEach(() => {
    urdtl = new UserDetail();
  });

  it("get and set data", () => {
    urdtl.UserId = "abc";
    urdtl.Email = "aaa@bbb.com";
    urdtl.Others = "others";
    urdtl.DisplayAs = "Abc";

    const data = urdtl.onGetData();
    expect(data).toBeTruthy();

    const urdtl2 = new UserDetail();
    urdtl2.onSetData(data);
    expect(urdtl2.UserId).toEqual(urdtl.UserId);
    expect(urdtl2.Email).toEqual(urdtl.Email);
    expect(urdtl2.Others).toEqual(urdtl.Others);
    expect(urdtl2.DisplayAs).toEqual(urdtl.DisplayAs);
  });
});

describe("UserAuthInfo", () => {
  let authinfo: UserAuthInfo;
  let usrvalue: any;

  beforeEach(() => {
    authinfo = new UserAuthInfo();
    usrvalue = {
      userId: "user1_sub",
      userName: "user1_mail",
      accessToken: "user1_access_token",
    };
  });

  it("init: not authorized", () => {
    expect(authinfo).toBeTruthy();
    expect(authinfo.isAuthorized).toBeFalsy();
  });

  it("setContent shall work", () => {
    expect(authinfo.isAuthorized).toBeFalsy();

    authinfo.setContent(usrvalue);
    expect(authinfo.isAuthorized).toBeTruthy();
    if (usrvalue.profile) {
      expect(authinfo.getUserName()).toEqual(usrvalue.profile?.name);
      expect(authinfo.getUserId()).toEqual(usrvalue.profile?.sub);
      //expect(authinfo.getUserMailbox()).toEqual(usrvalue.profile['mail']);
      expect(authinfo.getAccessToken()).toEqual(usrvalue.access_token);
    }

    authinfo.cleanContent();
    expect(authinfo.isAuthorized).toBeFalsy();
    expect(authinfo.getUserName()).toBeUndefined();
    expect(authinfo.getUserId()).toBeUndefined();
    //expect(authinfo.getUserMailbox()).toBeUndefined();
    expect(authinfo.getAccessToken()).toBeUndefined();
  });
});
