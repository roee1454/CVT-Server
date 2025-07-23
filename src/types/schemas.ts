import { z } from "zod";

export const createUserDtoSchema = z.object({
    fullName: z.string(),
    email: z.string().email("Invalid email address"),
    username: z.string().min(2, { message: "Too short username" }).max(30, { message: "Too long username" }),
    hash: z.string({ message: "Invalid `hash` property\nIn this context, `hash` is the password of the user" }).min(2, { message: "Too short password" }).max(30 ,{ message: "Too long password" })
})

export const loginUserDtoSchema = z.object({
    email: z.string().email("Invalid email address"),
    hash: z.string({ message: "Invalid `hash` property\nIn this context, `hash` is the password of the user" }).min(2, { message: "Too short password" }).max(30 ,{ message: "Too long password" })
})

export const passwordResetSchema =  z.object({
  newPassowrd: z.string({ message: "נדרש להקליד סיסמא" }).min(2, { message: "סיסמא קצרה מידי" }).max(30 ,{ message: "סיסמא ארוכה מידי" })
})

export const createProjectDtoSchema = z.object({
    title: z.string().min(2, { message: "Project title most have at least 2 characters" }).max(30, { message: "Project title most have max 30 characters" }),
    description: z.string().min(2, { message: "Project description most have at least 2 characters" }).max(1000, { message: "Project description momst have max 1000 characters" }),
    files: z.array(z.any())
})

export const containerSchema = z.object({
  projectId: z.string(),
  name: z.string().min(2, { message: "קונטיינר צריך שם שיש בו יותר מ2 אותיות" }),
  image: z.string().optional(),
  environmentVariables: z.string().optional(),
  hostPort: z.string().optional(),
  containerContent: z
    .any()
    .refine((files: FileList) => files?.length === 1, { message: 'יש לעלות תיקיה.' })
    .refine((files: FileList) => files?.[0]?.name.toLowerCase().endsWith('.tar') || files?.[0].name.toLowerCase().endsWith(".zip"), { message: 'File must have a .tar or a .zip extension.' }),
  buildId: z.string(),
})

export const softwareSchema = z.object({
    title: z.string().min(2, { message: "כותרת צריכה להכיל לפחות 2 אותיות" }),
    description: z.string().min(5, { message: "תיאור צריך להכיל לפחות 5 אותיות" }),
    url: z.string().url({ message: "כתובת URL לא תקינה" }),
    contacts: z.array(z.string().email({ message: "כתובת אימייל לא תקינה" })).min(1, { message: "נדרש לפחות איש קשר אחד" })
});

export const contactSchema = z.object({
  name: z.string().min(1, "שם חייב להיות לפחות תו אחד"),
  email: z.string().email("כתובת אימייל לא חוקית"),
  phoneNum: z.string().min(5, "מספר טלפון קצר מדי"),
});

export const createSystemSchema =  z.object({
    title: z.string().min(1, "הכותרת לא יכולה להיות ריקה"),
    descripion: z.string().min(1, "התיאור לא יכול להיות ריק"),
    contacts: z.array(contactSchema).nonempty("חייב להיות לפחות איש קשר אחד"),   
})

export const createMemberSchema = z.object({
    name: z.string().min(1, "חייבת להיות אות אחת לשם"),
    email: z.string().email({ message: "כתובת מייל לא תקינה" }),
    phoneNum: z.string().min(1, "מספר טלפון לא תקין"),
    ad: z.string().min(1, "מספר אישי לא תקין")
})

export const updateMemberSchema = createMemberSchema.extend({
    id: z.string().uuid("מזהה ייחודי לא תקין")
})
