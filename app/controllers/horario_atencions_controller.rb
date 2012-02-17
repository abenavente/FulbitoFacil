class HorarioAtencionsController < ApplicationController
  # GET /horario_atencions
  # GET /horario_atencions.json
  def index
    @search = HorarioAtencion.where(:cancha_id => params[:id])     
    @horario_atencions= @search.all   
 
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @horario_atencions }
    end
  end

  # GET /horario_atencions/1
  # GET /horario_atencions/1.json
  def show
    @horario_atencion = HorarioAtencion.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @horario_atencion }
    end
  end

  # GET /horario_atencions/new
  # GET /horario_atencions/new.json
  def new
    @horario_atencion = HorarioAtencion.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @horario_atencion }
    end
  end

  # GET /horario_atencions/1/edit
  def edit
    @horario_atencion = HorarioAtencion.find(params[:id])
  end

  # POST /horario_atencions
  # POST /horario_atencions.json
  def create
    @horario_atencion = HorarioAtencion.new(params[:horario_atencion])

    respond_to do |format|
      if @horario_atencion.save
        format.html { redirect_to @horario_atencion, notice: 'Horario atencion was successfully created.' }
        format.json { render json: @horario_atencion, status: :created, location: @horario_atencion }
      else
        format.html { render action: "new" }
        format.json { render json: @horario_atencion.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /horario_atencions/1
  # PUT /horario_atencions/1.json
  def update
    @horario_atencion = HorarioAtencion.find(params[:id])

    respond_to do |format|
      if @horario_atencion.update_attributes(params[:horario_atencion])
        format.html { redirect_to @horario_atencion, notice: 'Horario atencion was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @horario_atencion.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /horario_atencions/1
  # DELETE /horario_atencions/1.json
  def destroy
    @horario_atencion = HorarioAtencion.find(params[:id])
    @horario_atencion.destroy

    respond_to do |format|
      format.html { redirect_to horario_atencions_url }
      format.json { head :no_content }
    end
  end
end
