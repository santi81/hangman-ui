FROM python:3.7.5

LABEL maintainer="santosh.addanki@gmail.com"


RUN mkdir /app
COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt
EXPOSE 9000
ENTRYPOINT ["python"]
CMD ["app.py"]