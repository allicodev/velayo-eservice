import Loader from "./utils/loader";
import Api from "./api.service";
import {
  UserLoginProps,
  ExtendedResponse,
  User,
  UserWithToken,
  PageProps,
  Response,
  ProtectedUser,
} from "@/types";

class UserService {
  private readonly instance = new Api();

  public async login(
    payload: UserLoginProps
  ): Promise<ExtendedResponse<UserWithToken>> {
    const response = await this.instance.post<UserWithToken>({
      endpoint: "/auth/login",
      payload,
      publicRoute: true,
    });
    return response;
  }

  public async newUser(payload: User): Promise<ExtendedResponse<User>> {
    const response = await this.instance.post<User>({
      endpoint: "/user/new-user",
      payload,
    });
    return response;
  }

  public async updateUser(payload: User): Promise<ExtendedResponse<User>> {
    const response = await this.instance.post<User>({
      endpoint: "/user/update-user",
      payload,
    });
    return response;
  }

  public async getUsers(
    prop: PageProps
  ): Promise<ExtendedResponse<ProtectedUser[] | User[]>> {
    const response = await this.instance.get<ProtectedUser[] | User[]>({
      endpoint: "/user/get-users",
      query: prop,
    });
    return response;
  }

  public async deleteUser({ id }: { id: string }): Promise<Response> {
    const response = await this.instance.get<Response>({
      endpoint: "/user/remove-user",
      query: {
        id,
      },
    });
    return response;
  }
}

export default UserService;
