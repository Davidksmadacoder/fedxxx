import { IAdmin } from "../models/admin.model";

export interface UserService {
  getUserDetails(userId: string): Promise<IAdmin>;
}