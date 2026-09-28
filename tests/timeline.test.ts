import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import JTimeline from '../src/components/timeline/JTimeline.vue'
import JTimelineItem from '../src/components/timeline/JTimelineItem.vue'

describe('JTimeline', () => {
  it('renders an ordered list of items', () => {
    const wrapper = mount(JTimeline, {
      slots: {
        default: () => [
          h(JTimelineItem, { title: 'Deployed', time: '2h ago', status: 'complete' }, () => 'v1.2.0 shipped'),
          h(JTimelineItem, { title: 'Review', status: 'current' }),
          h(JTimelineItem, { title: 'Release', status: 'upcoming' }),
        ],
      },
    })
    expect(wrapper.element.tagName).toBe('OL')
    const items = wrapper.findAll('.j-timeline-item')
    expect(items).toHaveLength(3)
    expect(items[0]!.classes()).toContain('j-timeline-item--complete')
    expect(items[0]!.find('.j-timeline-item__title').text()).toBe('Deployed')
    expect(items[0]!.find('.j-timeline-item__time').text()).toBe('2h ago')
    expect(items[0]!.find('.j-timeline-item__body').text()).toBe('v1.2.0 shipped')
    expect(items[1]!.classes()).toContain('j-timeline-item--current')
  })

  it('supports a custom marker slot', () => {
    const wrapper = mount(JTimelineItem, { props: { title: 'x' }, slots: { marker: '<span class="dot" />' } })
    expect(wrapper.find('.j-timeline-item__marker .dot').exists()).toBe(true)
  })
})
