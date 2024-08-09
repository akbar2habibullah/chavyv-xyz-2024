"use client"

import { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useErrorStore } from '@/utils/frontend/store'

const ErrorContainer = () => {
  const { error, setError } = useErrorStore()

  useEffect(() => {
    if (error) {
      toast.error(error, {
        onClose: () => setError(null),
      })
    }
  }, [error, setError])

  return <ToastContainer />
}

export default ErrorContainer