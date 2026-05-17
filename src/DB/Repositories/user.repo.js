import { User } from "../models/index.js";
import {BaseRepository} from "./base.repo.js";

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }
}

export default new UserRepository();