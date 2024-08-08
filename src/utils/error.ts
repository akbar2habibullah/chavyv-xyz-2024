import {NextRequest, NextResponse} from 'next/server';
import { appendLog } from './log'
import { trimStringToMaxLength } from './string'

type CallbackFunc = (req: NextRequest, res: NextResponse) => Promise<NextResponse<Response>> | Promise<Response>;

export default function errorHandler(callbacFunc: CallbackFunc) {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      return await callbacFunc(req, res);
    } catch (error) {
      await appendLog(`API Error: ${trimStringToMaxLength(JSON.stringify(error), 200)}`)
      return NextResponse.json({error}, {status: 500});
    }
  };
}