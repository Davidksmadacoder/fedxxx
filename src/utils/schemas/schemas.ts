// schemas.ts
import { z } from "zod";

/**
 * Shared Enums / Helpers
 */
export const ShipmentStatusZ = z.enum([
    "PENDING",
    "DISPATCHED",
    "IN_TRANSIT",
    "ARRIVED",
    "CUSTOMS",
    "DELIVERED",
    "CANCELLED",
]);

// Robust ISO-ish date validation (matches Joi.date() on backend)
const IsoDateString = z
    .string()
    .min(1, "Date is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

// Number coercers (form inputs often come through as strings)
const PositiveNumber = z.coerce.number().positive("Value must be greater than 0");
const NonNegativeNumber = z.coerce.number().min(0, "Value cannot be negative");

// Contact block used by Parcel DTOs
const ContactZ = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
});

/**
 * AUTH
 * Backend expects { email, password } (service uses `password`)
 */
export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

/**
 * PARCELS
 * CreateParcelDto: all required; imageUrls is required (array), can be empty.
 */
export const CreateParcelSchema = z.object({
    sender: ContactZ,
    receiver: ContactZ,
    description: z.string().min(1, "Description is required"),
    weight: PositiveNumber, // Joi.number().positive().required()
    dimensions: z.string().min(1, "Dimensions are required"),
    imageUrls: z.array(z.string().url("Invalid image URL")), // required by DTO (can be empty array)
    transportMeans: z.string().min(1, "Transport means is required"), // ObjectId string
    pickupDate: IsoDateString,
    estimatedDeliveryDate: IsoDateString,
    fromLocation: z.string().min(1, "From location is required"),
    toLocation: z.string().min(1, "To location is required"),
});
export type CreateParcelFormData = z.infer<typeof CreateParcelSchema>;

/**
 * UpdateParcelDto: all fields optional; includes actualDeliveryDate & currentStatus (enum)
 */
export const UpdateParcelSchema = z.object({
    sender: ContactZ.partial().optional(),
    receiver: ContactZ.partial().optional(),
    description: z.string().optional(),
    weight: PositiveNumber.optional(),
    dimensions: z.string().optional(),
    imageUrls: z.array(z.string().url("Invalid image URL")).optional(),
    transportMeans: z.string().optional(),
    pickupDate: IsoDateString.optional(),
    estimatedDeliveryDate: IsoDateString.optional(),
    actualDeliveryDate: IsoDateString.optional(),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    currentStatus: ShipmentStatusZ.optional(),
});
export type UpdateParcelFormData = z.infer<typeof UpdateParcelSchema>;

/**
 * AddTimelineDto: required status/message/timelineDate/sendEmail; location optional
 */
export const AddTimelineSchema = z.object({
    status: ShipmentStatusZ,
    message: z.string().min(1, "Message is required"),
    timelineDate: IsoDateString,
    location: z.string().optional(),
    sendEmail: z.coerce.boolean(), // <-- coerce "true"/"false"
});
export type AddTimelineFormData = z.infer<typeof AddTimelineSchema>;
/**
 * AddLocationDto: required lat/lng/timestamp/sendEmail; visible optional (default true)
 */
export const AddLocationSchema = z.object({
    latitude: z.coerce.number()
        .refine((n) => !Number.isNaN(n), "Latitude must be a number")
        .refine((n) => n >= -90 && n <= 90, "Latitude must be between -90 and 90"),
    longitude: z.coerce.number()
        .refine((n) => !Number.isNaN(n), "Longitude must be a number")
        .refine((n) => n >= -180 && n <= 180, "Longitude must be between -180 and 180"),
    timestamp: IsoDateString,
    visible: z.coerce.boolean().optional().default(true),
    sendEmail: z.coerce.boolean(),
});

export type AddLocationFormData = z.infer<typeof AddLocationSchema>;

/**
 * TRANSPORT MEANS
 * CreateTransportMeansDto: required except description (optional) & active (default true)
 */
export const CreateTransportMeansSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    description: z.string().optional(),
    capacity: PositiveNumber, // required positive
    estimatedTime: z.string().min(1, "Estimated time is required"),
    costPerKm: NonNegativeNumber, // required >= 0
    active: z.boolean().optional().default(true),
    availabilityDate: IsoDateString,
    lastMaintenanceDate: IsoDateString,
});
export type CreateTransportMeansFormData = z.infer<typeof CreateTransportMeansSchema>;

/**
 * UpdateTransportMeansDto: all optional
 */
export const UpdateTransportMeansSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    capacity: PositiveNumber.optional(),
    estimatedTime: z.string().optional(),
    costPerKm: NonNegativeNumber.optional(),
    active: z.boolean().optional(),
    availabilityDate: IsoDateString.optional(),
    lastMaintenanceDate: IsoDateString.optional(),
});
export type UpdateTransportMeansFormData = z.infer<typeof UpdateTransportMeansSchema>;
