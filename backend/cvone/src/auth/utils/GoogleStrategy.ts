import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const clientID = configService.get<string>('CLIENT_ID');
    const clientSecret = configService.get<string>('CLIENT_SECRET');
    const callbackURL = configService.get<string>('CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth config values');
    }
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    const email = profile.emails?.[0]?.value;
    const fullName = profile.displayName;
    const googleId = profile.id;
    const avatar = profile.photos?.[0]?.value;

    if (!email) {
      throw new Error('No email found in Google profile');
    }
    if (!avatar) {
      throw new Error('No avatar found in Google profile');
    }
    const user = this.authService.validateOAuthUser({
      email,
      fullName,
      googleId,
      avatar,
    });

    return user || null;
  }
}
