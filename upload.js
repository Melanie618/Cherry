import request from '@/utils/request'
const baseURL = ''

export function uploadImage(data) {
  const formData = new FormData()
  formData.append('file', data)
  return request({
    url: baseURL + '/upload/image',
    headers: {
      'Content-Type': 'multipart/form-data;'
    },
    method: 'post',
    data: formData
  })
}

export function uploadFile(data) {
  const formData = new FormData()
  formData.append('file', data)
  return request({
    url: baseURL + '/upload/file',
    headers: {
      'Content-Type': 'multipart/form-data;'
    },
    method: 'post',
    data: formData
  })
}
