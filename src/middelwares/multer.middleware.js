import multer from "multer";
import fs from "fs";
import { extentions } from "../Utils/constants.utils.js";
import pathh from "path";


const multerLocal = (path, limits= {}) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = `uploads/${path}`;
                fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },

        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

            // بناخد الامتداد الحقيقي للفايل زي ما هو (.jpg أو .png) من اسمه الأصلي
            const ext = pathh.extname(file.originalname); // ده بيرجع مثلاً '.jpg' بالملي

            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });

  const fileFilter = (req, file, cb) => {
    const [filetype, fileExt] = file.mimetype.split('/');
    //بنفصل النوع عن الامتداد عشان نقدر نتحكم في السماح بامتدادات معينة لكل نوع (image, video, document)
    const allowedExtensions = extentions[filetype]
    // هنا بنشيك الأول إذا كان نوع الملف (image, video, document) مدعوم أصلاً، ولو مدعوم بنشيك إذا الامتداد بتاعه موجود ضمن الامتدادات المسموح بيها لهذا النوع
    if(!allowedExtensions || !allowedExtensions.includes(fileExt)) {
        // لو الامتداد مش مسموح بيه، بنرجع رسالة خطأ بتوضح إيه الامتدادات المسموح بيها لهذا النوع، ولو النوع نفسه مش مدعوم بنرجع رسالة بتوضح كده
        const errorMsg = allowedExtensions
            ? `Only ${allowedExtensions.join(', ')} files are allowed for ${filetype}!`
            : `File type [${filetype}] is not supported at all!`;
            // مرحعتش كول باك عادية لاني عايزة اخصص الرسالة شوية عشان تبقى أوضح للمستخدم، فبنشيل الرسالة الافتراضية وبنحط الرسالة اللي انا مركباها، وكمان بحط كود الحالة 400 عشان يوضح ان الخطأ من جهة المستخدم مش السيرفر
        const error = new Error(errorMsg);
        error.statusCode = 400;
        error.cause = 400;

        return cb(error, false);
    }
        cb(null, true);
    };

    return multer({ fileFilter,storage, limits});
}

export default multerLocal;