<template>
  <div class="q-gutter-md">
    <q-chip outline color="primary" icon="filter_list">
      Character / Chapter / Arc / Setting
    </q-chip>

    <q-timeline color="primary">
      <q-timeline-entry
        v-for="(event, index) in timelineEvents"
        :key="event.title"
        :title="event.title"
        :subtitle="event.subtitle"
        :icon="index % 2 === 0 ? 'event' : 'radio_button_checked'"
      >
        <div class="text-body2 text-grey-8">
          {{ event.description }}
        </div>
      </q-timeline-entry>
    </q-timeline>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-8">
        <q-card bordered flat>
          <q-card-section class="text-subtitle1 text-weight-medium"
            >Selected Event Detail</q-card-section
          >
          <q-separator />
          <q-list separator>
            <q-item v-for="detail in selectedEventDetails" :key="detail">
              <q-item-section>{{ detail }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card bordered flat>
          <q-card-section class="text-subtitle1 text-weight-medium">Quick Jump</q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="jump in quickJumps" :key="jump">
              <q-item-section>{{ jump }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
const timelineEvents = [
  { title: 'Event 1', subtitle: 'Chapter 1', description: 'Opening story beat and setup.' },
  { title: 'Event 2', subtitle: 'Chapter 3', description: 'Major conflict begins.' },
  { title: 'Event 3', subtitle: 'Chapter 6', description: 'Character relationship shifts.' },
  { title: 'Event 4', subtitle: 'Chapter 9', description: 'Turning point for the arc.' },
]

const selectedEventDetails = ['Summary', 'Connected Characters', 'Connected Settings']
const quickJumps = ['Previous Major Event', 'Next Major Event']
</script>
