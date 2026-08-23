from dateutil import parser
def parse_date(date_str):
    if not date_str: return None
    return parser.parse(date_str)
