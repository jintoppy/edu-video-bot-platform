import HMS from "@100mslive/server-sdk";

// Initialize the SDK with credentials from env variables
const hms = new HMS.SDK();

interface CreateRoomOptions {
  name: string;
  description?: string;
  templateId?: string;
}

export async function create100msRoom({ name, description, templateId }: CreateRoomOptions) {
  try {
    const roomCreateOptions = {
      name,
      description,
      template_id: templateId || process.env.HMS_TEMPLATE_ID,
    };

    const room = await hms.rooms.create(roomCreateOptions);
    return room;
  } catch (error) {
    console.error('Error creating 100ms room:', error);
    throw error;
  }
}

export async function generate100msToken(roomId: string, role: string, userId: string) {
  try {
    const tokenConfig = {
      roomId,
      role,
      userId,
      // Token valid for 24 hours
      validForSeconds: 24 * 60 * 60
    };

    const token = await hms.auth.getAuthToken(tokenConfig);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}