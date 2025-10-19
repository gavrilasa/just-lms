import z from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;
export const courseCategories = [
	"Development",
	"Business",
	"Finance",
	"IT & Software",
	"Office Productivity",
	"Personal Development",
	"Design",
	"Marketing",
	"Health & Fitness",
	"Music",
	"Teaching & Academics",
] as const;

export const courseSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" })
		.max(100, { message: "Title cannot exceed 100 characters" }),
	description: z
		.string()
		.min(3, { message: "Description must be at least 3 characters long" }),
	fileKey: z.string().min(1, { message: "File key cannot be empty" }),
	price: z.number().min(1, { message: "Price must be positive number" }),
	duration: z
		.number()
		.min(1, { message: "Duration must be at least 1 hours" })
		.max(500, { message: "Duration cannot exceed 500 hours" }),
	level: z.enum(courseLevels, { message: "Level is required" }),
	category: z.enum(courseCategories, { message: "Category is Required" }),
	smallDescription: z
		.string()
		.min(1, { message: "Small description cannot be empty" })
		.max(200, { message: "Small description cannot exceed 200 characters" }),
	slug: z
		.string()
		.min(3, { message: "Slug must be at least 3 characters long" }),
	status: z.enum(courseStatus, { message: "Status is required" }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
