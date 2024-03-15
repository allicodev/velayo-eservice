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

class UserService extends Loader {
  private readonly instance = new Api();

  public async login(
    payload: UserLoginProps
  ): Promise<ExtendedResponse<UserWithToken>> {
    this.loaderPush("logging-in");
    const response = await this.instance.post<UserWithToken>({
      endpoint: "/auth/login",
      payload,
      publicRoute: true,
    });
    this.loaderPop("loggin-in");
    return response;
  }

  public async newUser(payload: User): Promise<ExtendedResponse<User>> {
    this.loaderPush("registering");
    const response = await this.instance.post<User>({
      endpoint: "/user/new-user",
      payload,
    });
    this.loaderPop("registering");
    return response;
  }

  public async getUsers(
    prop: PageProps
  ): Promise<ExtendedResponse<ProtectedUser[]>> {
    this.loaderPush("fetch-users");
    const response = await this.instance.get<ProtectedUser[]>({
      endpoint: "/user/get-users",
      query: prop,
    });
    this.loaderPop("fetch-users");
    return response;
  }

  public async deleteUser({ id }: { id: string }): Promise<Response> {
    this.loaderPush("fetch-users");
    const response = await this.instance.get<Response>({
      endpoint: "/user/remove-user",
      query: {
        id,
      },
    });
    this.loaderPop("fetch-users");
    return response;
  }
}

export default UserService;
