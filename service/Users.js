import model from '../model/UsersFS.js';
import obtainIp from './Geolocalization/obtainIp.js';
import NodeMailer from './Notifications/Nodemailer.js';
import Geolocalization from './Geolocalization/obtainLocation.js';
import fs from 'fs'
class Service_Users {
    constructor() {
        this.model = new model();
        this.nodeMailer = new NodeMailer();
        this.obtainIp = new obtainIp();
        this.Geolocalization = new Geolocalization();
    }

    readNodeMailerFile = async () => {
        let nodeMsg = [];
        try {
            const read = await fs.promises.readFile('MsgNodeMailer.json', 'utf-8');
            nodeMsg = JSON.parse(read);
        } catch {
            console.log('error al leer');
        }
        console.log(nodeMsg)
        return nodeMsg;
    }

    getUser = async (uname, pass) => {
        let user = {};
        if (uname !== undefined) {
            user = await this.model.getUser(uname, pass);
            if (Object.keys(user).length && !user.msg) {
                let msgFile = await this.readNodeMailerFile();
                let loginMsg = msgFile.find(msg => msg.type === "login");
                await this.nodeMailer.sendMail(user.uname, loginMsg.subject, loginMsg.msg);
            }
        }
        const ipActual = await this.obtainIp.getUserIP();
        console.log(await this.Geolocalization.getGeolocation(ipActual))
        return user;
    }
    
    modifyUser = async (id, user) => {
        const userMod = await this.model.modifyUser(id, user);
/*         if (Object.keys(userMod).length) {
            let msgFile = await this.readNodeMailerFile();
            let itemMsg = msgFile.find(msg => msg.type === "item");
            await this.nodeMailer.sendMail(user.uname, itemMsg.subject, itemMsg.msg);
        } */
        return userMod;
    }
    
    createUser = async (user) => {
        const userCreated = await this.model.createUser(user);
        if (Object.keys(userCreated).length) {
            console.log(this.nodeMailerFile)
            let msgFile = await this.readNodeMailerFile();
            let createMsg = msgFile.find(msg => msg.type === "create");
            await this.nodeMailer.sendMail(user.uname, createMsg.subject, createMsg.msg);
        }
        return userCreated;
    }
    
    removeUser = async (id) => {
        const userRemoved = await this.model.removeUser(id);
        return userRemoved;
    }
}

export default Service_Users;
