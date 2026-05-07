
import { INotification } from "../../common/interfaces/notification.interface";
import { NotificationModel } from "../models/notification.model";
import { BaseRepository } from "./base.repository";


export class NotificationRepository extends BaseRepository<INotification> {

    constructor(){
        super(NotificationModel)

    }

}