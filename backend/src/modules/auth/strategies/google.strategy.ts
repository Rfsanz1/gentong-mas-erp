import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service.js';

// When GOOGLE_CLIENT_ID is not configured we register the strategy with a
// placeholder so that NestJS DI doesn't crash on startup. The route guard
// will simply redirect to /login if Google OAuth is not configured.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'NOT_CONFIGURED';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'NOT_CONFIGURED';
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    if (CLIENT_ID === 'NOT_CONFIGURED') {
      done(new Error('Google OAuth não está configurado. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.'), undefined);
      return;
    }
    try {
      const user = await this.authService.validateGoogleUser(profile);
      done(null, user);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
}
