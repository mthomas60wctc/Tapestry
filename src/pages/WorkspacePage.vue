<template>
  <div class="q-gutter-md">
    <q-card bordered flat>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-7">
          <q-input outlined dense label="Book Title / Selector" />
        </div>
        <div class="col-12 col-md-5">
          <q-input outlined dense label="Filters / Sort / Add Entity" />
        </div>
      </q-card-section>
    </q-card>

    <q-splitter v-model="splitter" bordered separator-class="bg-grey-4">
      <template #before>
        <q-card bordered flat class="full-height">
          <q-card-section class="text-subtitle1 text-weight-medium">Sidebar Tabs</q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="tab in workspaceTabs" :key="tab">
              <q-item-section>{{ tab }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </template>

      <template #after>
        <div class="q-gutter-md q-pl-md">
          <div class="row q-col-gutter-md items-stretch">
            <div class="col-12 col-lg-8">
              <q-card bordered flat>
                <q-card-section class="text-subtitle1 text-weight-medium"
                  >Entity List + Detail</q-card-section
                >
                <q-separator />
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-4">
                      <q-list bordered separator>
                        <q-item v-for="item in entityList" :key="item">
                          <q-item-section>{{ item }}</q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div class="col-12 col-sm-8">
                      <q-list bordered separator>
                        <q-item v-for="item in entityDetails" :key="item">
                          <q-item-section>{{ item }}</q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-lg-4">
              <q-card bordered flat>
                <q-card-section class="text-subtitle1 text-weight-medium"
                  >Related Links</q-card-section
                >
                <q-separator />
                <q-list separator>
                  <q-item v-for="link in relatedLinks" :key="link">
                    <q-item-section>{{ link }}</q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const splitter = ref(25)
const workspaceTabs = ['Characters', 'Events', 'Settings', 'Relationships', 'Notes']
const entityList = ['Entity Item', 'Entity Item', 'Entity Item', 'Entity Item']
const entityDetails = ['Name / Metadata', 'Description', 'Linked Events', 'Linked Settings']
const relatedLinks = ['Jump to Character A', 'Jump to Event B', 'Jump to Setting C']
</script>
