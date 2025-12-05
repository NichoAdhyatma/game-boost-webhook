export interface WhatsAppConfig {
  baseUrl: string;
  token: string;
  deviceId: string;
  defaultRecipient: string; 
}

export interface SendMessageRequest {
  session_id: string;
  message: string;
  to: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    id: number;
    message_id: string;
    status: string;
  };
  message: string;
}

export interface GetSessionResponse {
  success: boolean;
  data: {
    session_id: string;
  };
}

