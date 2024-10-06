import "dotenv/config";
const API_KEY = process.env.MG_API_KEY;
const DOMAIN = "mellob.in";

const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: "api", key: API_KEY });

export const send_mail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
) => {
  try {
    const data = {
      from: "Noobsverse <support@mellob.in>",
      to: [to],
      subject: subject,
      text: text,
      html: html,
    };

    const result = await client.messages.create(DOMAIN, data);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
