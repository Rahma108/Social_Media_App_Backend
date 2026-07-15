import { GITHUB, INSTAGRAM_LINK, LINKEDIN_LINK } from "../../../config/config"


interface EmailTemplateParams {
    code: number;
    title: string;
}

        export const emailTemplate = ({
        code,
        title,
        }: EmailTemplateParams) => {
        return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        </head>

        <body style="
            margin:0;
            padding:0;
            background:#f4f6f9;
            font-family:Arial, Helvetica, sans-serif;
        ">

        <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
        <td align="center">

        <table width="600" cellspacing="0" cellpadding="0"
        style="
        background:#ffffff;
        margin:40px auto;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 5px 20px rgba(0,0,0,.08);
        ">

        <!-- Header -->
        <tr>
        <td
        style="
        background:#4F46E5;
        padding:35px;
        text-align:center;
        ">

        <h1
        style="
        color:#fff;
        margin:0;
        font-size:32px;
        ">
        SocialSphere
        </h1>

        <p
        style="
        color:#dfe3ff;
        margin-top:10px;
        font-size:15px;
        ">
        Connect. Share. Discover.
        </p>

        </td>
        </tr>

        <!-- Content -->
        <tr>
        <td style="padding:40px;">

        <h2
        style="
        margin-top:0;
        color:#222;
        text-align:center;
        ">
        ${title}
        </h2>

        <p
        style="
        font-size:16px;
        line-height:1.8;
        color:#555;
        text-align:center;
        ">
        Use the verification code below to continue.
        This code will expire in <strong>10 minutes</strong>.
        </p>

        <div
        style="
        margin:35px auto;
        width:220px;
        background:#EEF2FF;
        border:2px dashed #4F46E5;
        border-radius:10px;
        padding:18px;
        text-align:center;
        font-size:34px;
        font-weight:bold;
        letter-spacing:8px;
        color:#4F46E5;
        ">
        ${code}
        </div>

        <p
        style="
        text-align:center;
        color:#777;
        font-size:14px;
        ">
        If you didn't request this email,
        you can safely ignore it.
        </p>

        </td>
        </tr>

        <!-- Footer -->
        <tr>
        <td
        style="
        padding:25px;
        background:#fafafa;
        text-align:center;
        ">

        <p
        style="
        margin-bottom:20px;
        color:#666;
        font-size:14px;
        ">
        Stay connected with us
        </p>

        <div style="margin-top:20px;">

       <a href="${LINKEDIN_LINK}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="50px" hight="50px"></span></a>
                
                <a href="${INSTAGRAM_LINK}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>
                
                <a href="${GITHUB}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" width="50px" hight="50px"></span>
                </a>

                </div>

        <p
        style="
        margin-top:25px;
        font-size:12px;
        color:#999;
        ">
        © ${new Date().getFullYear()} SocialSphere.
        All rights reserved.
        </p>

        </td>
        </tr>

        </table>

        </td>
        </tr>
        </table>

        </body>
        </html>
        `;
        };

