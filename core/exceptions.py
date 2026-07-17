from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            'error': True,
            'status_code': response.status_code,
            'message': _get_error_message(response.data),
            'details': response.data
        }
        response.data = custom_response_data

    return response

def _get_error_message(data):
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        if 'detail' in data:
            return data['detail']
        # Return first error message found
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f"{key}: {value[0]}"
            return f"{key}: {value}"
    return str(data)
