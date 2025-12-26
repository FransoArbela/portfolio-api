"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function login(req, res) {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt_1.default.compare(password, await bcrypt_1.default.hash(process.env.ADMIN_PASSWORD || "", 10));
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ message: "Server configuration error" });
    }
    const token = jsonwebtoken_1.default.sign({ role: "admin" }, jwtSecret, {
        expiresIn: "1d",
    });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });
    return res.json({ ok: true });
}
function me(req, res) {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ ok: false });
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ ok: false });
    try {
        jsonwebtoken_1.default.verify(token, secret);
        return res.json({ ok: true, role: "admin" });
    }
    catch {
        return res.status(401).json({ ok: false });
    }
}
function logout(_req, res) {
    res.clearCookie("token");
    return res.json({ ok: true });
}
