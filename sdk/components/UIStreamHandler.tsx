import { JSONValue } from "ai";
import { useEffect } from "react";

export interface UIComponent {
  type: string;
  data: any;
  messageId?: string;
  isVisible: boolean;
}

// Component to handle UI stream data
export const UIStreamHandler = ({
  streamingData,
  setUIComponent,
}: {
  streamingData?: JSONValue[];
  setUIComponent: React.Dispatch<React.SetStateAction<UIComponent | null>>;
}) => {
  useEffect(() => {
    if (!streamingData?.length) return;

    // Process the latest streaming data
    const lastData = streamingData[streamingData.length - 1];

    console.log("lastData", lastData);

    if (
      typeof lastData === "object" &&
      lastData !== null &&
      "type" in lastData &&
      "content" in lastData
    ) {
      if (lastData.type === "ui") {
        setUIComponent({
          type: (lastData.content as any).type,
          data: lastData.content as any,
          messageId: (lastData as any).messageId,
          isVisible: true,
        });
      }
    }
  }, [streamingData, setUIComponent]);

  return null;
};
