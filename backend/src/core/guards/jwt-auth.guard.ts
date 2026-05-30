import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Global JWT guard — registered as APP_GUARD in AppModule.
 * Reads @Public() metadata directly via Reflect.getMetadata to avoid
 * the tsx/esbuild constructor-parameter-metadata injection issue with Reflector.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const isPublic =
      Reflect.getMetadata(IS_PUBLIC_KEY, handler) === true ||
      Reflect.getMetadata(IS_PUBLIC_KEY, classRef) === true;
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
