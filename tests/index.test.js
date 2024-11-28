const { default: axios } = require("axios");

const BACKEND_URL = "http://localhost:3000";

describe("Authentication", () => {
  test("User is able to sign up only one", async () => {
    const username = "Ahmed" + Math.random();
    const password = "123456";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.status).toBe(200);

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.status).toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const password = "123456";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
      type: "admin",
    });
    expect(response.status).toBe(400);
  });

  test("Signin request succeeds if the username and password are correct", async () => {
    const username = "Ahmed" + Math.random();
    const password = "123456";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test("Signin request fails if the username or password is incorrect", async () => {
    const username = "Ahmed" + Math.random();
    const password = "123456";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "Wrong Username",
      password,
    });

    expect(response.status).toBe(403);
  });
});

describe("User Metadata", () => {
  let token;
  let avatarId;

  beforeAll(async () => {
    // signing up
    const username = "Ahmed" + Math.random();
    const password = "123456";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    // signing in
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.data.token;

    // creating an avatar to use in subsequent tests
    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        image:
          "https://www.google.com/imgres?q=avatars&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-psd%2F3d-render-avatar-character_23-2150611765.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Favatar&docid=DjJcL6-DnnZi6M&tbnid=ErjaVYy1eVY8DM&vet=12ahUKEwj8ytaCx-uJAxUHTKQEHVNcAYQQM3oECBkQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwj8ytaCx-uJAxUHTKQEHVNcAYQQM3oECBkQAA",
        name: "Jimmy",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.avatarId;
  });

  test("User cant update their metadata with wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "12324234",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });

  test("User can update their metadata with rught avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Unauthorized users cant update their metadata", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });

    expect(response.status).toBe(403);
  });
});

describe("User Avatar", () => {
  let avatarId;
  let userId;

  beforeAll(async () => {
    // signing up
    const username = "Ahmed" + Math.random();
    const password = "123456";

    const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    userId = signUpResponse.data.userId;

    // signing in
    const signInResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    const token = signInResponse.data.token;

    // creating an avatar to use in subsequent tests
    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        image:
          "https://www.google.com/imgres?q=avatars&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-psd%2F3d-illustration-human-avatar-profile_23-2150671142.jpg&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-psd%2F3d-illustration-human-avatar-profile_58509057.htm&docid=vlN-WYeGWcgfRM&tbnid=FwNZ5GOVnzizSM&vet=12ahUKEwjllZ7B0uuJAxVkcKQEHcCEOwgQM3oECEoQAA..i&w=626&h=626&hcb=2&ved=2ahUKEwjllZ7B0uuJAxVkcKQEHcCEOwgQM3oECEoQAA",
        name: "Timmy",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.avatarId;
  });

  test("Get avatar id for a user", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBeDefined();
    expect(response.data.avatars[0].userId).toBe(userId);
  });

  test("Get available avatars", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

    expect(response.data.avatars.length).not.toBe(0);

    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("User Space", () => {
  let adminId;
  let adminToken;
  let element1Id;
  let element2Id;
  let mapId;
  let userId;
  let userToken;

  beforeAll(async () => {
    // signing up as an admin
    const adminUsername = "Ahmed" + Math.random();
    const adminPassword = "123456";

    const adminSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        adminUsername,
        adminPassword,
        type: "admin",
      }
    );

    adminId = adminSignUpResponse.data.userId;

    // signing in as an admin
    const adminSignInResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        adminUsername,
        adminPassword,
      }
    );

    adminToken = adminSignInResponse.data.token;

    // creating some elements for creating the map
    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://www.google.com/imgres?q=chair&imgurl=https%3A%2F%2Fhomedesign.pk%2F2302-large_default%2Fbest-ergonomic-leather-office-chair-hd-oc-015.jpg&imgrefurl=https%3A%2F%2Fhomedesign.pk%2Foffice-chair%2F587-best-ergonomic-leather-office-chair-hd-oc-015.html&docid=2MpvdsQd9x2FvM&tbnid=bZDTmcswOiROHM&vet=12ahUKEwjj2_mf1-uJAxVc9rsIHfjaAPIQM3oECHsQAA..i&w=800&h=800&hcb=2&ved=2ahUKEwjj2_mf1-uJAxVc9rsIHfjaAPIQM3oECHsQAA",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://www.google.com/imgres?q=table&imgurl=http%3A%2F%2Finterwood.pk%2Fcdn%2Fshop%2Fproducts%2Fmorris_study_table.jpg%3Fv%3D1687434534&imgrefurl=https%3A%2F%2Finterwood.pk%2Fproducts%2Fmorris-study-table&docid=yPcvB9J_zbT5OM&tbnid=MIz5M5ZQgVrftM&vet=12ahUKEwj9jcqp1-uJAxV_UaQEHXU4JgoQM3oECGUQAA..i&w=920&h=700&hcb=2&ved=2ahUKEwj9jcqp1-uJAxV_UaQEHXU4JgoQM3oECGUQAA",
        width: 2,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    // creating the map
    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail:
          "https://www.google.com/imgres?q=office&imgurl=https%3A%2F%2Fofficebanao.com%2Fwp-content%2Fuploads%2F2024%2F03%2Fmodern-office-room-with-white-walls-1024x683.jpg&imgrefurl=https%3A%2F%2Fofficebanao.com%2F10-office-room-design-ideas-for-modern-office%2F&docid=umxvxkhEo0I_rM&tbnid=Mir-EGsu9RRTAM&vet=12ahUKEwisoODD1-uJAxWVgP0HHRudEmQQM3oECBUQAA..i&w=1024&h=683&hcb=2&ved=2ahUKEwisoODD1-uJAxWVgP0HHRudEmQQM3oECBUQAA",
        dimensions: "100x200",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 20,
            y: 60,
          },
          {
            elementId: element2Id,
            x: 40,
            y: 40,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${admminToken}`,
        },
      }
    );

    mapId = mapResponse.data.id;

    // signing up as a user
    const username = "Usman" + Math.random();
    const password = "987654321";

    const userSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        type: "user",
      }
    );

    userId = userSignUpResponse.data.userId;

    // signing in as a user
    const userSignInResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
      }
    );

    userToken = userSignInResponse.data.token;
  });

  test("User can create a space", async () => {
    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test space",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(spaceResponse.data.spaceId).toBeDefined();
  });

  test("User can create an empty space without selecting a map", async () => {
    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test space",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(spaceResponse.data.spaceId).toBeDefined();
  });

  test("User cant create a space without either selecting a map or specifying the dimensions ", async () => {
    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test space",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(spaceResponse.status).toBe(400);
  });

  test("User cant delete a space which doesnot exist", async () => {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/space/120938012983`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });

  test("User can delete a self-created space", async () => {
    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test space",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const spaceId = spaceResponse.data.spaceId;

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(deleteResponse.status).toBe(200);
  });

  test("User cant delete a space created by another user", async () => {
    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test space",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const spaceId = spaceResponse.data.spaceId;

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(deleteResponse.status).toBe(403);
  });

  test("Admin has no spaces initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/spaces/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin can create spaces", async () => {
    await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test 1",
        dimensions: "100x200",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const response = await axios.get(`${BACKEND_URL}/api/v1/spaces/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.data.spaces.length).toBe(1);
    expect(response.data.spaces[0].spaceId).toBeDefined();
  });
});

describe("Arena Endpoints", () => {
  let adminId;
  let adminToken;
  let userId;
  let userToken;
  let element1Id;
  let element2Id;
  let mapId;
  let arenaId;
  beforeAll(async () => {
    // signing up as an admin
    const adminUsername = "Ahmed" + Math.random();
    const adminPassword = "123456";

    const adminSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        adminUsername,
        adminPassword,
        type: "admin",
      }
    );

    adminId = adminSignUpResponse.data.userId;

    // signing in as an admin
    const adminSignInResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        adminUsername,
        adminPassword,
      }
    );

    adminToken = adminSignInResponse.data.token;

    // creating some elements for creating the map
    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://www.google.com/imgres?q=chair&imgurl=https%3A%2F%2Fhomedesign.pk%2F2302-large_default%2Fbest-ergonomic-leather-office-chair-hd-oc-015.jpg&imgrefurl=https%3A%2F%2Fhomedesign.pk%2Foffice-chair%2F587-best-ergonomic-leather-office-chair-hd-oc-015.html&docid=2MpvdsQd9x2FvM&tbnid=bZDTmcswOiROHM&vet=12ahUKEwjj2_mf1-uJAxVc9rsIHfjaAPIQM3oECHsQAA..i&w=800&h=800&hcb=2&ved=2ahUKEwjj2_mf1-uJAxVc9rsIHfjaAPIQM3oECHsQAA",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://www.google.com/imgres?q=table&imgurl=http%3A%2F%2Finterwood.pk%2Fcdn%2Fshop%2Fproducts%2Fmorris_study_table.jpg%3Fv%3D1687434534&imgrefurl=https%3A%2F%2Finterwood.pk%2Fproducts%2Fmorris-study-table&docid=yPcvB9J_zbT5OM&tbnid=MIz5M5ZQgVrftM&vet=12ahUKEwj9jcqp1-uJAxV_UaQEHXU4JgoQM3oECGUQAA..i&w=920&h=700&hcb=2&ved=2ahUKEwj9jcqp1-uJAxV_UaQEHXU4JgoQM3oECGUQAA",
        width: 2,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    // creating the map
    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail:
          "https://www.google.com/imgres?q=office&imgurl=https%3A%2F%2Fofficebanao.com%2Fwp-content%2Fuploads%2F2024%2F03%2Fmodern-office-room-with-white-walls-1024x683.jpg&imgrefurl=https%3A%2F%2Fofficebanao.com%2F10-office-room-design-ideas-for-modern-office%2F&docid=umxvxkhEo0I_rM&tbnid=Mir-EGsu9RRTAM&vet=12ahUKEwisoODD1-uJAxWVgP0HHRudEmQQM3oECBUQAA..i&w=1024&h=683&hcb=2&ved=2ahUKEwisoODD1-uJAxWVgP0HHRudEmQQM3oECBUQAA",
        dimensions: "100x200",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 20,
            y: 60,
          },
          {
            elementId: element2Id,
            x: 40,
            y: 40,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${admminToken}`,
        },
      }
    );

    mapId = mapResponse.data.id;

    // creating a space
    const arenaResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test space",
        mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    arenaId = spaceResponse.data.spaceId;

    // signing up as a user
    const username = "Usman" + Math.random();
    const password = "987654321";

    const userSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        type: "user",
      }
    );

    userId = userSignUpResponse.data.userId;

    // signing in as a user
    const userSignInResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
      }
    );

    userToken = userSignInResponse.data.token;
  });

  test("Users cant get the elements for an incorect arena", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/space/xlcnfwoit29845209`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });

  test("Users can get all the elements for a correct arena", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${arenaId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe(3);
  });

  test("Users can delete an element from a self-created arena", async () => {
    const getArenaResponseBeforeElementDeletion = await axios.get(
      `${BACKEND_URL}/api/v1/space/${arenaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const idOfFirstElement =
      getArenaResponseBeforeElementDeletion.data.elements[0].id;

    const deletionResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        spaceId: arenaId,
        elementId: idOfFirstElement,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(deletionResponse.status).toBe(200);

    const getArenaResponseAfterElementDeletion = await axios.get(
      `${BACKEND_URL}/api/v1/space/${arenaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(getArenaResponseAfterElementDeletion.data.elements.length).toBe(2);
  });

  test("Users can add an element within the correct dimensions into a self-created arena", async () => {
    const additionResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: arenaId,
        x: "10",
        y: "20",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(additionResponse.status).toBe(200);

    const getArenaResponseAfterElementAddition = await axios.get(
      `${BACKEND_URL}/api/v1/space/${arenaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(getArenaResponseAfterElementAddition.data.elements.length).toBe(3);
  });
});
