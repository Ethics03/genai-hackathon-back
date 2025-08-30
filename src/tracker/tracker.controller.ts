import { Body, Controller, Post } from '@nestjs/common';
import { sleepEntryDTO } from './dto/tracker.dto';
import { TrackerService } from './tracker.service';

@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerservice: TrackerService) {}

  @Post('sleep')
  async sleepEntry(@Body() body: sleepEntryDTO) {
    return this.trackerservice.sleepDetails(body);
  }
}
