import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '@service';
import { FeatureName, FEATURES } from '@store/shared-models';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
  features = FEATURES;
  configService = inject(ConfigurationService);

  asFeature = (val: string) => val as FeatureName;
}
