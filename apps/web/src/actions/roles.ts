'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const RoleSchema = z.object({
    name: z.string().min(2, "Rol adı en az 2 karakter olmalıdır"),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
    isSystem: z.boolean().optional(),
});

export async function createRole(_prevState: unknown, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const permissions = formData.getAll("permissions") as string[];

    const validatedFields = RoleSchema.safeParse({
        name,
        description,
        permissions,
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Lütfen tüm alanları kontrol ediniz.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        // Create role and connect permissions (if we had pre-defined permissions)
        // For now, let's assume permissions are created dynamically or selected from existing
        // If selected from existing, we need their IDs.

        // Let's assume input 'permissions' are permission IDs.
        const permissionConnect = permissions.map(id => ({ id }));

        await prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    connect: permissionConnect
                }
            }
        });

        revalidatePath("/admin/roles");
    } catch (error) {
        console.error("Role creation error:", error);
        return {
            success: false,
            message: "Rol oluşturulurken bir hata oluştu.",
        };
    }

    redirect("/admin/roles");
}

export async function deleteRole(roleId: string) {
    try {
        await prisma.role.delete({
            where: { id: roleId }
        });
        revalidatePath("/admin/roles");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Silinemedi" };
    }
}
