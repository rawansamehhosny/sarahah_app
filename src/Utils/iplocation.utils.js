import axios from "axios";

export const getIPLocation = async (ip) => {
    try {
        // تنظيف الـ IP لو جاي مدمج فيه كذا كبشة IPs (بتحصل مع الـ proxy)
        const cleanIp = ip ? ip.split(',')[0].trim() : '';

        if (!cleanIp || cleanIp === '::1' || cleanIp === '127.0.0.1') {
            return { country: 'EG', city: 'Cairo' }; // يفضل نرجع كود دولة حقيقي عشان الـ switch يلقطه
        }

        const response = await axios.get(`http://ip-api.com/json/${cleanIp}`);

        if (response.data && response.data.status === 'success') {
            return {
                country: response.data.countryCode, // 💡 ملحوظة: الـ API ده بيرجع الكود (EG, US) في countryCode مش country
                city: response.data.city
            };
        }

        return { country: 'default', city: 'default' };
    } catch (error) {
        console.error('Error fetching IP location:', error.message);
        //  ممنوع الـ throw هنا! بنرجع قيم افتراضية عشان السيرفر ميعطلش
        return { country: 'default', city: 'default' };
    }
};

