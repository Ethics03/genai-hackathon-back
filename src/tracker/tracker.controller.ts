import { Body, Controller, Post } from '@nestjs/common';
import { moodEntryDTO, sleepEntryDTO } from './dto/tracker.dto';
import { TrackerService } from './tracker.service';

@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerservice: TrackerService) {}

  @Post('sleep-entry')
  async sleepEntry(@Body() body: sleepEntryDTO) {
    return this.trackerservice.sleepDetails(body);
  }

  @Post('mood-entry')
  async moodEntry(@Body() body: moodEntryDTO) {
    return this.trackerservice.addMood(body);
  }
}
