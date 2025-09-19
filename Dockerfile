#Creates a layer from node:alpine image.
# FROM chub.cloud.gov.in/mit6c0-ogd/node-16:nic_server
FROM node:alpine


# RUN echo 'deb http://deb.debian.org/debian stretch main' >> apk update \
#     apk add curl git nano wget screen vim

#Creates directories
RUN mkdir -p /usr/src/app

# env

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

##Copy new files or directories into the filesystem of the container
COPY . /usr/src/app

#Execute commands in a new layer on top of the current image and commit the results
RUN npm install --  
# RUN npm run build

# Expose port 3000 to host
EXPOSE 3000

#Allows you to configure a container that will run as an executable
CMD npm run build && npm start
