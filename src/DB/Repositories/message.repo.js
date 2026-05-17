import { Message } from "../models/index.js";
import {BaseRepository} from "./base.repo.js";

class MessageRepository extends BaseRepository {
    constructor() {
        super(Message);
    }
}

export default new MessageRepository();