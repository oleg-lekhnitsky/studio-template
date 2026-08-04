import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      type: 'file',
      description: 'Use a compressed MP4 or WebM. Short loops without audio load fastest.',
      options: { accept: 'video/mp4,video/webm' }
    }),
    defineField({
      name: 'url',
      title: 'External video URL',
      type: 'url',
      description: 'Paste a Vimeo page URL, for example https://vimeo.com/1127174952.'
    }),
    defineField({ name: 'poster', type: 'image' }),
    defineField({ name: 'width', type: 'string', options: { list: ['half', 'full'], layout: 'radio' }, initialValue: 'full' })
  ],
  validation: rule => rule.custom(value => value?.file || value?.url ? true : 'Add a video file or URL')
})
