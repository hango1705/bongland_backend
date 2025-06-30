const nodemailer = require("nodemailer");
const inLineBase64 = require("nodemailer-plugin-inline-base64");
const dotenv = require("dotenv");
dotenv.config();

const sendEmailCreateOrder = async (email, orderItems) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "haninhquang2003@gmail.com",
      pass: "haninhquang2003",
    },
  });
  transporter.use("compile", inLineBase64({ cidPrefix: "somePrefix_" }));
  let listItem = "";
  const attachImage = [];
  orderItems.forEach((order) => {
    listItem += `<div>
    <div>Bạn đã đặt sản phẩm <b>${order.name}<b/> với số lượng: <b>${order.amount}<b/> và giá là : <b>${order.price}đ<b/><div/>
    <div>Bên dưới là hình ảnh sản phẩm:<div/>
    <div/>`;
    attachImage.push({ path: order.image });
  });
  let info = await transporter.sendMail({
    from: "haninhquang2003@gmail.com",
    to: "haninhquang2003@gmail.com",
    subject: "Cảm ơn bạn đã đặt hàng tại BÔNG LAND",
    text: "Hello world?",
    html: `<div><b>Bạn đã đặt hàng thành công tại BÔNG LAND</b><div/> ${listItem}`,
    attachments: attachImage,
  });
};
module.exports = { sendEmailCreateOrder };
