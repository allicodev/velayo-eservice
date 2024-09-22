import API from "./api.service";
import {
  UserLoginProps,
  ExtendedResponse,
  User,
  UserWithToken,
  PageProps,
  Response,
  ProtectedUser,
} from "@/types";

abstract class UserService {
  public static async login(
    payload: UserLoginProps
  ): Promise<ExtendedResponse<UserWithToken>> {
    return await API.post<UserWithToken>({
      endpoint: "auth/login",
      payload,
    });
  }

  public static async newUser(payload: User): Promise<ExtendedResponse<User>> {
    return await API.post<User>({
      endpoint: "user/new-user",
      payload,
    });
  }

  public static async updateUser(
    payload: Partial<User>
  ): Promise<ExtendedResponse<User>> {
    return await API.post<User>({
      endpoint: "user/update-user",
      payload,
    });
  }

  public static async getUsers(
    prop: PageProps
  ): Promise<ExtendedResponse<ProtectedUser[] | User[]>> {
    let role: any = prop.role;
    if (prop.role) role = JSON.stringify(prop.role);
    return await API.get<ProtectedUser[] | User[]>({
      endpoint: "user/get-users",
      query: { ...prop, role },
    });
  }

  public static async deleteUser({ id }: { id: string }): Promise<Response> {
    return await API.get<Response>({
      endpoint: "user/remove-user",
      query: {
        id,
      },
    });
  }
}

export default UserService;
