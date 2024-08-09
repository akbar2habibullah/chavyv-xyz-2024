"use client"

import HeroSection from "@/component/hero"
import dynamic from 'next/dynamic'

import {RequestDetails} from 'deep-chat/dist/types/interceptors';
import { usePathname } from 'next/navigation'

export default function Chat() {
  const pathname = usePathname()
	
	const DeepChat = dynamic(() => import('deep-chat-react').then((mod) => mod.DeepChat), {
    ssr: false,
  });

	return (
		<HeroSection backgroundImage="/images/background.png">
      <DeepChat
        style={{borderRadius: '10px'}}
        introMessage={{text: 'Send a chat message to an example server.'}}
        connect={{url: '/api/custom/chat'}}
        requestBodyLimits={{maxMessages: -1}}
        requestInterceptor={(details: RequestDetails) => {
          console.log(details);
          return details;
        }}
        responseInterceptor={(response: any) => {
          console.log(response);
          return response;
        }}
    	/>
		</HeroSection>
	)
}
